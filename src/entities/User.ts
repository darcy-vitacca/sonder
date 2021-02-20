import {Entity as TOEntity, PrimaryGeneratedColumn, Column, Index} from "typeorm";
import Entity from './Entity'

@TOEntity('users')
export class User extends Entity {
    constructor(user: Partial<User>){
        super()// we have to add super because we are ingerting from base entity
        Object.assign(this, user)
    }

    @PrimaryGeneratedColumn()
    id: number;

   @Index()
   @Column({unique: true})
   email: string;

   @Index()
   @Column({unique: true})
   username: string;

   @Column({unique: true})
   phoneNumber: string;
   
   @Column()
   password: string;
   
   @Index()
   @Column()
   name: string;

}
