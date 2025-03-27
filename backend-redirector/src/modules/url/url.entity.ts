import { Entity, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { BaseEntity } from "../common/base.entity.js";

@Entity({ tableName: `urls` })
export class Url extends BaseEntity {
    @Property({ nullable: true, unique: true, name: "shortUrl" })
    shortUrl?: string;

    @Property({ name: "longUrl"})
    longUrl!: string;

    @Property({ hidden: true, nullable: true, name: "passwordHash" })
    passwordHash?: string;

    @Property({ default: 0, name: "visitorCount" })
    visitorCount!: bigint;

    @Property({ nullable: true, name: "expiredAt" })
    expiredAt?: Date;
}