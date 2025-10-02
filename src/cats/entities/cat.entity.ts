import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cats')
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  age: number;

  @Column({ nullable: true })
  breed: string;
}
