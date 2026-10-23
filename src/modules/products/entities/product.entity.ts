import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CartItem } from '../../cart-items/entities/cart-item.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @ApiProperty({
    example: 'cafd2cf6-0388-499e-acaf-ff6718953ffa',
    description: 'Unique identifier of the product',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-shirt',
    description: 'Name of the product',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    example: 99.99,
    description: 'Price of the product',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    example: 'High-quality cotton t-shirt',
    description: 'Detailed description of the product',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 50,
    description: 'Available stock quantity',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  stock: number;

  @ApiProperty({
    description: 'List of items referencing this product (not included by default)',
    type: () => [CartItem],
    required: false,
  })
  @OneToMany(() => CartItem, (item) => item.product)
  cartItems: CartItem[];

  @ApiProperty({
    example: '2025-11-02T21:13:31.848Z',
    description: 'Date and time when the product was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2025-11-02T21:13:31.848Z',
    description: 'Date and time when the product was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
