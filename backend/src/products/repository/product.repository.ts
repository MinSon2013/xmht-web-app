import moment from 'moment';
import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { ProductDto } from '../dto/modify-product.dto';
import { Product } from '../entities/product.entity';

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {

  async getProducts(): Promise<Product[]> {
    return await this.find();
  }

  async getOne(id: number): Promise<Product> {
    return await this.findOne({ id });
  }

  async createProduct(createProductDto: ProductDto): Promise<Product> {
    const product = this.mappingProduct(createProductDto);
    return await this.save(product)
  }

  async updateProduct(modifyProductDto: ProductDto): Promise<UpdateResult> {
    const product = this.mappingProduct(modifyProductDto);
    return await this.update(modifyProductDto.id, product);
  }

  async deleteProduct(id: number): Promise<DeleteResult> {
    return await this.delete(id);
  }

  private mappingProduct(modifyProductDto: ProductDto): Product {
    const product = new Product();
    product.name = modifyProductDto.name;
    product.quantity = modifyProductDto.quantity;
    product.price = modifyProductDto.price;
    product.note = modifyProductDto.note;
    if (modifyProductDto.id && modifyProductDto.id !== 0) {
      product.updatedDate = moment().format('DD/MM/YYYY');
    } else {
      product.createdDate = moment().format('DD/MM/YYYY');
      product.updatedDate = moment().format('DD/MM/YYYY');
    }
    return product;
  }
}