import 'reflect-metadata';
import type { DataSourceOptions, EntityTarget, Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import DiscoverSlider from './entity/DiscoverSlider';
import Issue from './entity/Issue';
import IssueComment from './entity/IssueComment';
import Media from './entity/Media';
import MediaRequest from './entity/MediaRequest';
import Season from './entity/Season';
import SeasonRequest from './entity/SeasonRequest';
import { Session } from './entity/Session';
import { User } from './entity/User';
import { UserPushSubscription } from './entity/UserPushSubscription';
import { UserSettings } from './entity/UserSettings';

const devConfig: DataSourceOptions = {
  type: 'sqlite',
  database: process.env.CONFIG_DIRECTORY
    ? `${process.env.CONFIG_DIRECTORY}/db/db.sqlite3`
    : 'config/db/db.sqlite3',
  synchronize: true,
  migrationsRun: false,
  logging: false,
  enableWAL: true,
  entities: [
    DiscoverSlider,
    Issue,
    IssueComment,
    Media,
    MediaRequest,
    Season,
    SeasonRequest,
    Session,
    User,
    UserPushSubscription,
    UserSettings,
  ],
  migrations: ['server/migration/**/*.ts'],
  subscribers: ['server/subscriber/**/*.ts'],
};

const prodConfig: DataSourceOptions = {
  type: 'sqlite',
  database: process.env.CONFIG_DIRECTORY
    ? `${process.env.CONFIG_DIRECTORY}/db/db.sqlite3`
    : 'config/db/db.sqlite3',
  synchronize: false,
  migrationsRun: false,
  logging: false,
  enableWAL: true,
  entities: ['dist/entity/**/*.js'],
  migrations: ['dist/migration/**/*.js'],
  subscribers: ['dist/subscriber/**/*.js'],
};

const dataSource = new DataSource(
  process.env.NODE_ENV !== 'production' ? devConfig : prodConfig
);

export const getRepository = <Entity extends object>(
  target: EntityTarget<Entity>
): Repository<Entity> => {
  return dataSource.getRepository(target);
};

export default dataSource;
