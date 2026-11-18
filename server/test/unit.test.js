import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeAnswer, hashVerificationAnswer } from '../src/services/item.service.js';
import { registerSchema, loginSchema } from '../src/validators/auth.validator.js';
import { createItemSchema, queryItemsSchema } from '../src/validators/item.validator.js';
import { CATEGORIES, CAMPUS_ZONES } from '../src/models/Item.js';

test('Answer normalization: strips punctuation, lowercase, and trims whitespace', () => {
  const rawAnswer = '  Rick & Morty, Season 4! ';
  const normalized = normalizeAnswer(rawAnswer);
  assert.equal(normalized, 'rick morty season 4');

  const hashed = hashVerificationAnswer(normalized);
  assert.equal(typeof hashed, 'string');
  assert.equal(hashed.length, 64); // SHA-256 hex string length
});

test('Answer normalization: identical answers with different cases/punctuation produce same hash', () => {
  const hash1 = hashVerificationAnswer(normalizeAnswer('Blue Case!'));
  const hash2 = hashVerificationAnswer(normalizeAnswer('blue case'));
  const hash3 = hashVerificationAnswer(normalizeAnswer('  BLUE CASE...  '));
  assert.equal(hash1, hash2);
  assert.equal(hash2, hash3);
});

test('Categories and Campus Zones: contains all required campus zones and categories', () => {
  assert.ok(CAMPUS_ZONES.includes('Main Gate'));
  assert.ok(CAMPUS_ZONES.includes('Library'));
  assert.ok(CAMPUS_ZONES.includes('CS Dept'));
  assert.ok(CATEGORIES.includes('phone'));
  assert.ok(CATEGORIES.includes('laptop'));
  assert.ok(CATEGORIES.includes('id-card'));
});

test('Auth Validator: rejects password with fewer than 8 characters', () => {
  const invalidData = {
    body: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'short'
    }
  };
  assert.throws(() => registerSchema.parse(invalidData));
});

test('Auth Validator: accepts valid registration data', () => {
  const validData = {
    body: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      department: 'Computer Science'
    }
  };
  const parsed = registerSchema.parse(validData);
  assert.equal(parsed.body.name, 'John Doe');
  assert.equal(parsed.body.email, 'john@example.com');
});

test('Item Validator: accepts valid lost item', () => {
  const validLost = {
    body: {
      type: 'lost',
      title: 'Blue Water Bottle',
      category: 'bottle',
      zone: 'Library',
      dateEvent: new Date().toISOString()
    }
  };
  const parsed = createItemSchema.parse(validLost);
  assert.equal(parsed.body.type, 'lost');
  assert.equal(parsed.body.category, 'bottle');
});

test('Item Validator: rejects invalid category', () => {
  const invalidItem = {
    body: {
      type: 'lost',
      title: 'Hoverboard',
      category: 'spaceship',
      zone: 'Library',
      dateEvent: new Date().toISOString()
    }
  };
  assert.throws(() => createItemSchema.parse(invalidItem));
});
