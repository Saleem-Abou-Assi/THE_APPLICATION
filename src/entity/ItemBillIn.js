
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Items } from './Items';
import { BillsIn } from './BillsIn';

@Entity('item_bill_in')
export class ItemBillIn {
  @PrimaryGeneratedColumn()
  id;

  @ManyToOne(() => Items)
  @JoinColumn({ name: 'item_id' })
  item;

  @ManyToOne(() => BillsIn)
  @JoinColumn({ name: 'bill_in_id' })
  billIn;

  @Column('decimal')
  price;

  @Column('integer')
  quantity;

  @Column('string')
  note;

  @CreateDateColumn()
  created_at;

  @UpdateDateColumn()
  updated_at;
}
