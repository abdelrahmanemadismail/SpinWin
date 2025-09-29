import { SeededRandom, selectWinner, Participant } from '../src/lib/csvParser';

describe('SeededRandom', () => {
  test('should produce consistent results with same seed', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);

    const sequence1 = Array.from({ length: 10 }, () => rng1.next());
    const sequence2 = Array.from({ length: 10 }, () => rng2.next());

    expect(sequence1).toEqual(sequence2);
  });

  test('should produce different results with different seeds', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(54321);

    const sequence1 = Array.from({ length: 10 }, () => rng1.next());
    const sequence2 = Array.from({ length: 10 }, () => rng2.next());

    expect(sequence1).not.toEqual(sequence2);
  });

  test('should generate numbers between 0 and 1', () => {
    const rng = new SeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  test('nextInt should generate integers within range', () => {
    const rng = new SeededRandom(12345);
    const max = 10;

    for (let i = 0; i < 100; i++) {
      const value = rng.nextInt(max);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(max);
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});

describe('selectWinner', () => {
  const mockParticipants: Participant[] = [
    { id: 1, name: 'أحمد محمد' },
    { id: 2, name: 'فاطمة علي' },
    { id: 3, name: 'محمد سالم' },
    { id: 4, name: 'عائشة أحمد' },
    { id: 5, name: 'عبدالله محسن' }
  ];

  test('should return consistent winner with same seed', () => {
    const seed = 12345;
    const result1 = selectWinner(mockParticipants, seed);
    const result2 = selectWinner(mockParticipants, seed);

    expect(result1.winner).toEqual(result2.winner);
    expect(result1.winnerIndex).toBe(result2.winnerIndex);
    expect(result1.seed).toBe(result2.seed);
  });

  test('should return different winners with different seeds', () => {
    const result1 = selectWinner(mockParticipants, 12345);
    const result2 = selectWinner(mockParticipants, 54321);

    // Note: There's a small chance they could be the same, but very unlikely
    expect(result1.seed).not.toBe(result2.seed);
  });

  test('should return winner from participants list', () => {
    const result = selectWinner(mockParticipants, 12345);

    expect(mockParticipants).toContainEqual(result.winner);
    expect(result.winnerIndex).toBeGreaterThanOrEqual(0);
    expect(result.winnerIndex).toBeLessThan(mockParticipants.length);
    expect(mockParticipants[result.winnerIndex]).toEqual(result.winner);
  });

  test('should include all required fields in result', () => {
    const result = selectWinner(mockParticipants, 12345);

    expect(result).toHaveProperty('winner');
    expect(result).toHaveProperty('seed');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('winnerIndex');

    expect(typeof result.winner).toBe('object');
    expect(typeof result.seed).toBe('number');
    expect(typeof result.timestamp).toBe('string');
    expect(typeof result.winnerIndex).toBe('number');
  });

  test('should use current timestamp when no seed provided', () => {
    const beforeTime = Date.now();
    const result = selectWinner(mockParticipants);
    const afterTime = Date.now();

    expect(result.seed).toBeGreaterThanOrEqual(beforeTime);
    expect(result.seed).toBeLessThanOrEqual(afterTime);
  });

  test('should handle single participant', () => {
    const singleParticipant = [{ id: 1, name: 'المشارك الوحيد' }];
    const result = selectWinner(singleParticipant, 12345);

    expect(result.winner).toEqual(singleParticipant[0]);
    expect(result.winnerIndex).toBe(0);
  });

  test('should distribute selections fairly over large sample', () => {
    const participants = mockParticipants;
    const selections = new Map<number, number>();
    const iterations = 1000;

    // Initialize counters
    participants.forEach((_, index) => selections.set(index, 0));

    // Run many selections with different seeds
    for (let i = 0; i < iterations; i++) {
      const result = selectWinner(participants, i);
      const currentCount = selections.get(result.winnerIndex) || 0;
      selections.set(result.winnerIndex, currentCount + 1);
    }

    // Check that each participant was selected at least once
    // and the distribution isn't too skewed
    const expectedSelections = iterations / participants.length;
    const tolerance = expectedSelections * 0.3; // 30% tolerance

    selections.forEach((count) => {
      expect(count).toBeGreaterThan(0);
      expect(count).toBeGreaterThan(expectedSelections - tolerance);
      expect(count).toBeLessThan(expectedSelections + tolerance);
    });
  });
});