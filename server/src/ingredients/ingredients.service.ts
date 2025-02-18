import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class IngredientsService {
  constructor(private readonly databaseServices: DatabaseService) {}

  async create(createIngredientDto: Prisma.IngredientCreateInput) {
    try {
      return await this.databaseServices.ingredient.create({ data: createIngredientDto });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.databaseServices.ingredient.findMany({});
    } catch (error) {
      throw new BadRequestException('Failed to retrieve ingredients');
    }
  }

  async findOne(id: string) {
    try {
      const ingredient = await this.databaseServices.ingredient.findUnique({
        where: { id },
      });
      if (!ingredient) {
        throw new NotFoundException('Ingredient not found');
      }
      return ingredient;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateIngredientDto: Prisma.IngredientUpdateInput) {
    try {
      return await this.databaseServices.ingredient.update({
        where: { id },
        data: updateIngredientDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      return await this.databaseServices.ingredient.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findLowPriceIngredients() {
    console.log('Fetching low price ingredients...');

    // Fetch ingredients from the database
    const ingredients = await this.databaseServices.ingredient.findMany({
        select: {
            id: true,
            name: true,
            price_per_unit: true,
            quantity: true,
        },
    });

    // Step 1: Sort ingredients by name, then by price_per_unit
    ingredients.sort((a, b) => {
        if (a.name !== b.name) return a.name.localeCompare(b.name);
        return parseFloat(a.price_per_unit.toString()) - parseFloat(b.price_per_unit.toString());
    });

    // Step 2: Group ingredients by name
    const groupedIngredients: Record<string, any[]> = {};
    for (const ingredient of ingredients) {
        if (!groupedIngredients[ingredient.name]) {
            groupedIngredients[ingredient.name] = [];
        }
        groupedIngredients[ingredient.name].push(ingredient);
    }

    // Step 3: Binary Search to find the lowest price in each group
    function binarySearchLowestPrice(items: any[]) {
        let left = 0, right = items.length - 1;
        let minPriceIngredient = items[left];

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (items[mid].price_per_unit < minPriceIngredient.price_per_unit) {
                minPriceIngredient = items[mid];
            }
            right = mid - 1; // Move left to find the lowest
        }
        return minPriceIngredient;
    }

    // Step 4: Extract the lowest price ingredient and comparison details
    const lowPriceIngredients = Object.values(groupedIngredients).map(group => {
        const lowest = binarySearchLowestPrice(group);
        const highestPrice = group[group.length - 1].price_per_unit; // Last element in sorted list
        return {
            ...lowest,
            priceComparison: {
                lowestPrice: lowest.price_per_unit,
                highestPrice: highestPrice,
                priceDifference: highestPrice - lowest.price_per_unit,
                totalVariants: group.length
            }
        };
    });

    return lowPriceIngredients;
  }


  async findHighPriceIngredients() {
    console.log('Fetching high price ingredients...');

    // Step 1: Fetch ingredients from the database
    const ingredients = await this.databaseServices.ingredient.findMany({
        select: {
            id: true,
            name: true,
            price_per_unit: true,
            quantity: true,
        },
    });

    // Step 2: Sort ingredients by name, then by price_per_unit (Descending)
    ingredients.sort((a, b) => {
        if (a.name !== b.name) return a.name.localeCompare(b.name);
        return  parseFloat(b.price_per_unit.toString()) -  parseFloat(a.price_per_unit.toString()); // Highest price first
    });

    // Step 3: Group ingredients by name
    const groupedIngredients: Record<string, any[]> = {};
    for (const ingredient of ingredients) {
        if (!groupedIngredients[ingredient.name]) {
            groupedIngredients[ingredient.name] = [];
        }
        groupedIngredients[ingredient.name].push(ingredient);
    }

    // Step 4: Binary Search to find the highest price in each group
    function binarySearchHighestPrice(items: any[]) {
        let left = 0, right = items.length - 1;
        let maxPriceIngredient = items[left]; // Since sorted, first element is highest

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (items[mid].price_per_unit > maxPriceIngredient.price_per_unit) {
                maxPriceIngredient = items[mid];
            }
            left = mid + 1; // Move right to find the highest price
        }
        return maxPriceIngredient;
    }

    // Step 5: Extract the highest price ingredient and comparison details
    const highPriceIngredients = Object.values(groupedIngredients).map(group => {
        const highest = binarySearchHighestPrice(group);
        const lowestPrice = group[group.length - 1].price_per_unit; // Last element in sorted list
        return {
            ...highest,
            priceComparison: {
                lowestPrice: lowestPrice,
                highestPrice: highest.price_per_unit,
                priceDifference: highest.price_per_unit - lowestPrice,
                totalVariants: group.length
            }
        };
    });

    return highPriceIngredients;
  }
}