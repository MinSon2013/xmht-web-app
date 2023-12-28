import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { ProductDTO } from '../dto/modify-product.dto';
import { Product } from '../entities/product.entity';
import { Helper } from '../../shared/helper';

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
  private readonly helper = new Helper();

  async getProducts(): Promise<Product[]> {
    return await this.find();
  }

  async getOne(id: number): Promise<Product> {
    return await this.findOne({ id });
  }

  async createProduct(createProductDto: ProductDTO): Promise<Product> {
    const product = this.mappingProduct(createProductDto);
    return await this.save(product)
  }

  async updateProduct(modifyProductDto: ProductDTO): Promise<UpdateResult> {
    const product = this.mappingProduct(modifyProductDto);
    return await this.update(modifyProductDto.id, product);
  }

  async deleteProduct(id: number): Promise<DeleteResult> {
    return await this.delete(id);
  }

  private mappingProduct(modifyProductDto: ProductDTO): Product {
    const product = new Product();
    product.name = modifyProductDto.name;
    product.quantity = modifyProductDto.quantity;
    product.price = modifyProductDto.price;
    product.note = modifyProductDto.note;
    product.updatedByUserId = modifyProductDto.updatedByUserId;
    if (modifyProductDto.id && modifyProductDto.id !== 0) {
      product.updatedDate = this.helper.getUpdateDate(2);
    } else {
      product.createdDate = this.helper.getUpdateDate(2);
      product.updatedDate = this.helper.getUpdateDate(2);
    }
    return product;
  }
}