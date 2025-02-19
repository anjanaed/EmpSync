import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class IngredientsService {
  constructor(private readonly databaseServices: DatabaseService) {}

  async create(createIngredientDto: Prisma.IngredientCreateInput | Prisma.IngredientCreateInput[]) {
    if (Array.isArray(createIngredientDto)) {
      // Handle bulk creation
      return this.databaseServices.ingredient.createMany({
        data: createIngredientDto.map(ingredient => ({
          ...ingredient,
          price_per_unit: parseFloat(ingredient.price_per_unit.toString()),
          quantity: parseInt(ingredient.quantity.toString())
        }))
      });
    }
    // Handle single creation
    return this.databaseServices.ingredient.create({ 
      data: {
        ...createIngredientDto,
        price_per_unit: parseFloat(createIngredientDto.price_per_unit.toString()),
        quantity: parseInt(createIngredientDto.quantity.toString())
      } 
    });
  }

  async findAll() {
    return this.databaseServices.ingredient.findMany({});
  }

  async findOne(id: string) {
    return this.databaseServices.ingredient.findUnique({
      where:{
        id,
      },
    });
  }

  async update(id: string, updateIngredientDto: Prisma.IngredientUpdateInput) {
    return this.databaseServices.ingredient.update({
      where: {
        id,
      },
      data: updateIngredientDto,
    })
  }

  async remove(id: string) {
    return this.databaseServices.ingredient.delete({
      where:{
        id,
      },
    })
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
