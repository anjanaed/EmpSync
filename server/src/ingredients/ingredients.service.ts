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
    const ingredients = await this.databaseServices.ingredient.findMany({
      select: {
        id: true,
        name: true,
        price_per_unit: true,
        quantity: true,
      },
    });

    // Group ingredients by name
    const groupedIngredients = ingredients.reduce((acc, curr) => {
      if (!acc[curr.name]) {
        acc[curr.name] = {
          lowest: curr,
          items: [curr]
        };
      } else {
        acc[curr.name].items.push(curr);
        if (curr.price_per_unit < acc[curr.name].lowest.price_per_unit) {
          acc[curr.name].lowest = curr;
        }
      }
      return acc;
    }, {} as Record<string, { lowest: any; items: any[] }>);

    const lowPriceIngredients = Object.values(groupedIngredients).map(group => ({
      ...group.lowest,
      priceComparison: {
        lowestPrice: group.lowest.price_per_unit,
        highestPrice: Math.max(...group.items.map(item => item.price_per_unit)),
        priceDifference: Math.max(...group.items.map(item => item.price_per_unit)) - group.lowest.price_per_unit,
        totalVariants: group.items.length
      }
    }));

    return lowPriceIngredients;
  }

  async findHighPriceIngredients() {
    console.log('Fetching high price ingredients...');
    const ingredients = await this.databaseServices.ingredient.findMany({
      select: {
        id: true,
        name: true,
        price_per_unit: true,
        quantity: true,
      },
    });

    // Group ingredients by name
    const groupedIngredients = ingredients.reduce((acc, curr) => {
      if (!acc[curr.name]) {
        acc[curr.name] = {
          highest: curr,
          items: [curr]
        };
      } else {
        acc[curr.name].items.push(curr);
        if (curr.price_per_unit > acc[curr.name].highest.price_per_unit) {
          acc[curr.name].highest = curr;
        }
      }
      return acc;
    }, {} as Record<string, { highest: any; items: any[] }>);

    const highPriceIngredients = Object.values(groupedIngredients).map(group => ({
      ...group.highest,
      priceComparison: {
        lowestPrice: Math.min(...group.items.map(item => item.price_per_unit)),
        highestPrice: group.highest.price_per_unit,
        priceDifference: group.highest.price_per_unit - Math.min(...group.items.map(item => item.price_per_unit)),
        totalVariants: group.items.length
      }
    }));

    return highPriceIngredients;
  }
}
