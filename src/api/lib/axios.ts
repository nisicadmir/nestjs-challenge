import { InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

export const axiosGet = async <T>(url: string): Promise<T> => {
  try {
    const response = await axios.get(url);
    return response.data as T;
  } catch (error) {
    throw new InternalServerErrorException(
      'Failed to fetch data with axios',
      error,
    );
  }
};
