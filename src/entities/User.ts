import { Entity as TOEntity, PrimaryGeneratedColumn, Column, Index, BeforeInsert } from "typeorm";
import { IsEmail, Length, Min } from 'class-validator'
import { classToPlain, Exclude } from 'class-transformer'
import bcrypt from 'bcrypt'
import Entity from './Entity'

@TOEntity('users')
export default class User extends Entity {
    constructor(user: Partial<User>) {
        super()// we have to add super because we are ingerting from base entity
        Object.assign(this, user)
    }

    @PrimaryGeneratedColumn()
    id: number;


    @Index()
    @IsEmail(undefined, { message: 'Must be a valid email address' })
    @Length(1, 255, { message: 'Email is empty' })
    @Column({ unique: true })
    email: string


    @Index()
    @Length(6, 255, { message: 'Must be 6 characters or more without spaces.' })
    @Column({ unique: true })
    username: string


    @Index()
    @Column()
    @Length(1, 255, { message: 'Name is empty' })
    name: string;
    
    @Exclude()
    @Index()
    @Min(18)
    @Column()
    age: number;

    // @Exclude()
    // @Column({ unique: true })
    // phoneNumber: string;

    @Exclude()
    @Index()
    @Length(8, 255, { message: 'Must be a combination of 8 letters and numbers, including uppecase and lower case, without spaces.' })
    @Column()
    password: string

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 6)
        // this.phoneNumber = await bcrypt.hash(this.password, 6)
    }

    //this goes through and if a field has exclude it returns without it
    toJSON() {
        return classToPlain(this)
    }


}
