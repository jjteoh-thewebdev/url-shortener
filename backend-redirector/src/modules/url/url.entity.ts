import { Entity, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { BaseEntity } from "../common/base.entity.js";

@Entity({ tableName: `urls` })
export class Url extends BaseEntity {
    @Property({ nullable: true, unique: true })
    shortUrl?: string;

    @Property()
    longUrl!: string;

    @Property({ hidden: true, nullable: true })
    passwordHash?: string;

    @Property({ default: 0 })
    visitorCount!: bigint;

    @Property({ nullable: true })
    expiredAt?: Date;
}