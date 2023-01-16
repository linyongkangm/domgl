import { create, all } from 'mathjs';

export const math = create(all);
math.config({ number: 'BigNumber' });
