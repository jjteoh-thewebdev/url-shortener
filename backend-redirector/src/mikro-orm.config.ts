import { EntityCaseNamingStrategy, Options, PostgreSqlDriver, UnderscoreNamingStrategy } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

import dotenv from 'dotenv';


dotenv.config()

const config: Options = {
    driver: PostgreSqlDriver,
    clientUrl: process.env.DATABASE_URL,
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    // discovery: {
    //     disableDynamicFileAccess: false, // if true, need import entities explicitly
    // },
    namingStrategy: EntityCaseNamingStrategy,
    metadataProvider: TsMorphMetadataProvider,
    debug: false
}

export default config;