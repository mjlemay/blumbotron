import { Snowflake } from '@sapphire/snowflake';

export const generateSnowflake = () => {
    const epoch = new Date('2024-01-01T00:00:00.000Z');
    const snowflake = new Snowflake(epoch);
    const uniqueId = snowflake.generate();
    return uniqueId;
}