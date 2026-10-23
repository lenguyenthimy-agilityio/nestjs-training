import * as bcrypt from 'bcrypt';

export const HashProvider = {
  provide: 'HASH_PROVIDER',
  useFactory: () => {
    return {
      async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
      },
      async compare(password: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(password, hashed);
      },
    };
  },
};
