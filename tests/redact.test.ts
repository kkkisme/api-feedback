import { describe, expect, it } from 'vitest';
import { redactRecord, sanitizeValue } from '../src/utils/redact';

describe('redact utilities', () => {
  it('redacts sensitive headers', () => {
    expect(
      redactRecord(
        {
          Authorization: 'Bearer secret',
          'x-request-id': 'req-1'
        },
        {
          maxBodyLength: 100
        }
      )
    ).toEqual({
      Authorization: '[redacted]',
      'x-request-id': 'req-1'
    });
  });

  it('redacts sensitive body fields and keeps normal fields', () => {
    expect(
      sanitizeValue(
        {
          username: 'zhangsan',
          password: '123456',
          nested: {
            token: 'secret-token',
            orderId: 'o_1'
          }
        },
        {
          maxBodyLength: 100
        }
      )
    ).toEqual({
      username: 'zhangsan',
      password: '[redacted]',
      nested: {
        token: '[redacted]',
        orderId: 'o_1'
      }
    });
  });
});
