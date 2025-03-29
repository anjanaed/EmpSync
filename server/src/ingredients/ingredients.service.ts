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

  async getPriceComparison() {
    const ingredients = await this.databaseServices.ingredient.findMany({
      select: {
        name: true,
        type: true,
        price_per_unit: true,
      },
    });

    // Group ingredients by type
    const groupedByType: Record<string, { name: string; price_per_unit: number }[]> = {};
    for (const ingredient of ingredients) {
      if (!groupedByType[ingredient.type]) {
        groupedByType[ingredient.type] = [];
      }
      groupedByType[ingredient.type].push({
        name: ingredient.name,
        price_per_unit: Number(ingredient.price_per_unit),
      });
    }

    // Calculate price analysis for each type
    const priceAnalysis = Object.entries(groupedByType).map(([type, items]) => {
      const lowestPriceItem = items.reduce((prev, curr) =>
        prev.price_per_unit < curr.price_per_unit ? prev : curr
      );
      const highestPriceItem = items.reduce((prev, curr) =>
        prev.price_per_unit > curr.price_per_unit ? prev : curr
      );

      return {
        type,
        lowestPrice: {
          name: lowestPriceItem.name,
          price: lowestPriceItem.price_per_unit,
        },
        highestPrice: {
          name: highestPriceItem.name,
          price: highestPriceItem.price_per_unit,
        },
        priceDifference: highestPriceItem.price_per_unit - lowestPriceItem.price_per_unit,
        totalItems: items.length,
      };
    });

    return priceAnalysis;
  }

  
}
