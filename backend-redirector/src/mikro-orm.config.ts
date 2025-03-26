import { Options, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const config: Options = {
    driver: PostgreSqlDriver,
    clientUrl: process.env.DB_URL,
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    discovery: {
        disableDynamicFileAccess: true,
    },
    metadataProvider: TsMorphMetadataProvider,
    debug: false
}

export default config;