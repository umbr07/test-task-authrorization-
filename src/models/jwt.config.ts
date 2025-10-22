export interface payloadDto{
    userId: number;
    email: string;
    role: string;
}

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'my-secret-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'my-refresh-secret-key',
};