export const argon2Mock = {
    hash: jest.fn((password: string) => Promise.resolve(`hashed:${password}`)),
    verify: jest.fn((hash: string, password: string) => Promise.resolve(hash === `hashed:${password}`)),
  };

export const hash = jest.fn().mockResolvedValue('');
export const verify = jest.fn().mockResolvedValue(true);