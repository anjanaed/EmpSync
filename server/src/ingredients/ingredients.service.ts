import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class IngredientsService {
  constructor(private readonly databaseServices: DatabaseService) {}

  async create(createIngredientDto: Prisma.IngredientCreateInput | Prisma.IngredientCreateInput[]) {
    try {
      if (Array.isArray(createIngredientDto)) {
        return await this.databaseServices.ingredient.createMany({
          data: createIngredientDto.map(ingredient => ({
            ...ingredient,
            price_per_unit: parseFloat(ingredient.price_per_unit.toString()),
            quantity: parseInt(ingredient.quantity.toString())
          }))
        });
      }
      return await this.databaseServices.ingredient.create({ 
        data: {
          ...createIngredientDto,
          price_per_unit: parseFloat(createIngredientDto.price_per_unit.toString()),
          quantity: parseInt(createIngredientDto.quantity.toString())
        } 
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new HttpException(
          'Ingredient with this ID or Name already exists',
          HttpStatus.CONFLICT
        );
      }
      throw new HttpException(
        'Failed to create ingredient',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll() {
    const ingredients = await this.databaseServices.ingredient.findMany({});
    if (!ingredients || ingredients.length === 0) {
      throw new HttpException('No Ingredients', HttpStatus.NOT_FOUND);
    }
    return ingredients;
  }

  async findOne(id: string) {
    const ingredient = await this.databaseServices.ingredient.findUnique({
      where: { id }
    });
    if (!ingredient) {
      throw new HttpException('Ingredient Not found', HttpStatus.NOT_FOUND);
    }
    return ingredient;
  }

  async update(id: string, updateIngredientDto: Prisma.IngredientUpdateInput) {
    const ingredient = await this.findOne(id);
    if (!ingredient) {
      throw new HttpException('Ingredient Not found', HttpStatus.NOT_FOUND);
    }
    return this.databaseServices.ingredient.update({
      where: { id },
      data: updateIngredientDto,
    });
  }

  async remove(id: string) {
    const ingredient = await this.findOne(id);
    if (!ingredient) {
      throw new HttpException('Ingredient Not found', HttpStatus.NOT_FOUND);
    }
    return this.databaseServices.ingredient.delete({
      where: { id },
    });
  }

  async findLowPriceIngredients() {
    console.log('Fetching low price ingredients...');

    // Fetch ingredients from database
    const ingredients = await this.databaseServices.ingredient.findMany({
        select: {
            id: true,
            name: true,
            price_per_unit: true,
            quantity: true,
        },
    });

    // Step 1: Sort ingredients by name first, then by price_per_unit in ascending order
    ingredients.sort((a, b) => {
      const nameComparison = a.name.localeCompare(b.name);
      return nameComparison !== 0 ? nameComparison : Number(a.price_per_unit) - Number(b.price_per_unit);
    });

    // Step 2: Group ingredients by name
    const groupedIngredients: Record<string, any[]> = {};
    for (const ingredient of ingredients) {
        if (!groupedIngredients[ingredient.name]) {
            groupedIngredients[ingredient.name] = [];
        }
        groupedIngredients[ingredient.name].push(ingredient);
    }

    // Step 3: Use Binary Search to find the lowest price variant in each group
    function binarySearchLowest(items: any[]): any {
        let left = 0;
        let right = items.length - 1;
        let lowest = items[0]; // Since array is sorted, first element is the lowest

        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            if (items[mid].price_per_unit < lowest.price_per_unit) {
                lowest = items[mid];
            }
            right = mid - 1; // Keep searching in the left half for a lower price
        }

        return lowest;
    }

    // Step 4: Construct the final list with price comparisons
    const lowPriceIngredients = Object.entries(groupedIngredients).map(([name, items]) => {
        const lowest = binarySearchLowest(items);
        const highestPrice = items[items.length - 1].price_per_unit; // Since array is sorted, last element has the highest price

        return {
            ...lowest,
            priceComparison: {
                lowestPrice: lowest.price_per_unit,
                highestPrice: highestPrice,
                priceDifference: highestPrice - lowest.price_per_unit,
                totalVariants: items.length
            }
        };
    });

    return lowPriceIngredients;
  }

  async getIngredientStats() {
    const allIngredients = await this.databaseServices.ingredient.findMany({
      select: {
        id: true,
        priority: true
      }
    });

    const totalCount = allIngredients.length;
    
    // Count ingredients by priority
    const priorityCount = allIngredients.reduce((acc, ingredient) => {
      const priority = ingredient.priority || 'NORMAL'; // Default to NORMAL if priority is null
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCount,
      priorityCount,
      lastUpdated: new Date()
    };
  }

  async getAdvancedIngredientStats() {
    const ingredients = await this.databaseServices.ingredient.findMany({
      select: {
        id: true,
        name: true,
        priority: true,
        type: true,
        price_per_unit: true
      }
    });

    // Group ingredients by priority and type
    const groupedStats = ingredients.reduce((acc, ingredient) => {
      const priority = ingredient.priority || 'NORMAL';
      const type = ingredient.type || 'UNDEFINED';

      if (!acc[priority]) {
        acc[priority] = { types: {} };
      }
      if (!acc[priority].types[type]) {
        acc[priority].types[type] = [];
      }

      acc[priority].types[type].push(ingredient);
      return acc;
    }, {} as Record<string, { types: Record<string, any[]> }>);

    // Improved binary search function for finding price ranges
    function binarySearchPriceRange(items: any[]) {
      if (!items.length) return null;

      // Sort items by price_per_unit
      items.sort((a, b) => a.price_per_unit - b.price_per_unit);

      // Binary search for lowest price
      let low = 0, high = items.length - 1;
      let minPrice = items[0].price_per_unit;
      while (low < high) {
        let mid = Math.floor((low + high) / 2);
        if (items[mid].price_per_unit > minPrice) {
          high = mid;
        } else {
          low = mid + 1;
        }
      }
      let lowest = items[0].price_per_unit; // Use first item after sorting

      // Binary search for highest price
      low = 0;
      high = items.length - 1;
      let highest = items[items.length - 1].price_per_unit; // Use last item after sorting

      return {
        lowest,
        highest,
        count: items.length
      };
    }

    // Process each group to get price statistics using the new binary search
    const finalStats = Object.entries(groupedStats).reduce((acc, [priority, data]) => {
      acc[priority] = {
        types: Object.entries(data.types).reduce((typeAcc, [type, items]) => {
          typeAcc[type] = binarySearchPriceRange(items);
          return typeAcc;
        }, {}),
        totalCount: Object.values(data.types).flat().length
      };
      return acc;
    }, {} as Record<string, any>);

    return {
      statistics: finalStats,
      lastUpdated: new Date(),
      totalIngredients: ingredients.length
    };
  }
}
