// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   ManyToOne,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   JoinColumn,
// } from 'typeorm';
// import { Cart } from '../../carts/entities/cart.entity';
// import { Product } from '../../products/entities/product.entity';

// @Entity('cart_items')
// export class CartItem {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'cart_id' })
//   cart: Cart;

//   @ManyToOne(() => Product, (product) => product.cartItems, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'product_id' })
//   product: Product;

//   @Column({ type: 'int', default: 1 })
//   quantity: number;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }
