import { OptionalProps, PrimaryKey, Property } from '@mikro-orm/postgresql';

export abstract class BaseEntity<Optional = never> {

  [OptionalProps]?: 'createdAt' | Optional

  @PrimaryKey()
  id!: bigint

  @Property({ defaultRaw: 'now()', name: "createdAt" })
  createdAt = new Date()
}