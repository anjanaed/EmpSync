// import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// import { Prisma } from '@prisma/client';
// import { DatabaseService } from '../../database/database.service';

// @Injectable()
// export class StockService {
//     constructor(private readonly databaseServices: DatabaseService) {}

//     async create(createStockDto: Prisma.StockCreateInput | Prisma.StockCreateInput[]) {
//         try {
//             if (Array.isArray(createStockDto)) {
//                 return await this.databaseServices.stock.createMany({
//                     data: createStockDto.map(stock => ({
//                         ...stock,
//                     })),    
//                 });
//             }
//             return await this.databaseServices.stock.create({
//                 data: createStockDto,
//             // });
//         } catch (error) {
//             if (error?.code === 'P2002') {
//               throw new HttpException(
//                 'Ingredient with this ID or Name already exists',
//                 HttpStatus.CONFLICT,
//               );
//             }
//             throw new HttpException(
//               'Failed to create ingredient',
//               HttpStatus.INTERNAL_SERVER_ERROR,
//             );
//         }
//     }

//     async findAll() {
//         const ingredients = await this.databaseServices.stock.findMany({});
//         if (!ingredients || ingredients.length === 0) {
//         throw new HttpException('No Ingredients in stock', HttpStatus.NOT_FOUND);
//         }
//         return ingredients;
//     }

//     async findOne(id: number) {
//         // id is converted to number
//         const parsedId = parseInt(id.toString(), 10);
        
//         if (isNaN(parsedId)) {
//         throw new HttpException('Invalid ingredient ID', HttpStatus.BAD_REQUEST);
//         }

//         const ingredient = await this.databaseServices.stock.findUnique({
//         where: { id: parsedId }
//         });

//         if (!ingredient) {
//         throw new HttpException('Ingredient Not found', HttpStatus.NOT_FOUND);
//         }
//         return ingredient;
//     }

//     async update(id: number, updateStockDto: Prisma.IngredientUpdateInput) {
//         // The findOne method will now handle the id parsing
//         const ingredient = await this.findOne(id);
        
//         return this.databaseServices.stock.update({
//         where: { id: parseInt(id.toString(), 10) },
//         data: updateStockDto,
//         });
//     }

//     async remove(id: number) {
//         // The findOne method already handles ID validation and type conversion
//         const ingredient = await this.findOne(id);
        
//         try {
//             // Then delete the ingredient
//             return await this.databaseServices.stock.delete({
//                 where: { id: parseInt(id.toString(), 10) },
//             });
//         } catch (error) {
//             throw new HttpException(
//                 'Failed to delete ingredient',
//                 HttpStatus.INTERNAL_SERVER_ERROR
//             );
//         }
//     }
// }