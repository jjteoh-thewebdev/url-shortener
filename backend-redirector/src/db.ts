import { MikroORM, Options, EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import config from './mikro-orm.config.js';
import { Url } from './modules/url/url.entity.js';

export interface Services {
  orm: MikroORM;
  em: EntityManager;
  url: EntityRepository<Url>;
}

let cache: Services;

export async function initORM(options?: Options): Promise<Services> {
  if (cache) {
    return cache;
  }

  // allow overriding config options for testing
  const orm = await MikroORM.init({
    ...config,
    ...options,
  });

  // save to cache before returning
  return cache = {
    orm,
    em: orm.em,
    url: orm.em.getRepository(Url),
  };
}