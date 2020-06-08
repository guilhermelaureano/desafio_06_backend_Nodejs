import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  category: string;
  title: string;
  type: 'income' | 'outcome';
  value: number;
}

class CreateTransactionService {
  public async execute({
    category,
    title,
    type,
    value,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance.');
    }

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: transactionCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
