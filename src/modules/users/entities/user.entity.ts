import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Cart } from '../../carts/entities/cart.entity';
import { Exclude } from 'class-transformer';
import { Role } from '../../users/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: process.env.NODE_ENV === 'test' ? 'text' : 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
