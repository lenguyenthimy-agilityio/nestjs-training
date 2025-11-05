import { CacheHelperService } from './cache-helper.service';

const mockCacheManager = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  deleteByPattern: jest.fn(),
};

describe('CacheHelperService', () => {
  let service: CacheHelperService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CacheHelperService(mockCacheManager as any);
    jest.spyOn(console, 'log').mockImplementation(() => {}); // 👈 mock console.log
  });

  afterEach(() => {
    jest.restoreAllMocks(); // ✅ clean up after each test
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      await service.set('foo', { bar: 123 });

      expect(mockCacheManager.set).toHaveBeenCalledWith('foo', JSON.stringify({ bar: 123 }));
    });

    it('should set value with TTL', async () => {
      await service.set('foo', { bar: 123 }, 60);

      expect(mockCacheManager.set).toHaveBeenCalledWith('foo', JSON.stringify({ bar: 123 }), 'EX', 60);
    });
  });

  describe('get', () => {
    it('should get and parse JSON value', async () => {
      mockCacheManager.get.mockResolvedValue(JSON.stringify({ bar: 123 }));

      const result = await service.get('foo');

      expect(mockCacheManager.get).toHaveBeenCalledWith('foo');
      expect(result).toEqual({ bar: 123 });
    });

    it('should return null if no value found', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.get('foo');

      expect(result).toBeNull();
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      mockCacheManager.del.mockResolvedValue(1); // simulate Redis response

      const result = await service.del('foo');

      expect(mockCacheManager.del).toHaveBeenCalledWith('foo');
      expect(result).toBe(1); // success delete
    });
  });

  describe('deleteByPattern', () => {
    it('should log and return if no keys matched', async () => {
      mockCacheManager.keys.mockResolvedValue([]);

      await service.deleteByPattern('test:*');

      expect(mockCacheManager.keys).toHaveBeenCalledWith('test:*');
      expect(mockCacheManager.del).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('[CACHE] No keys matched pattern: test:*');
    });

    it('should delete all keys matching the pattern and log count', async () => {
      mockCacheManager.keys.mockResolvedValue(['test:1', 'test:2']);
      mockCacheManager.del.mockResolvedValue(2);

      await service.deleteByPattern('test:*');

      expect(mockCacheManager.keys).toHaveBeenCalledWith('test:*');
      expect(mockCacheManager.del).toHaveBeenCalledWith('test:1', 'test:2');
      expect(console.log).toHaveBeenCalledWith('[CACHE] Deleted 2 keys matching: test:*');
    });
  });

  describe('keys', () => {
    it('should return keys matching pattern', async () => {
      mockCacheManager.keys.mockResolvedValue(['a', 'b']);

      const result = await service.keys('pattern:*');

      expect(mockCacheManager.keys).toHaveBeenCalledWith('pattern:*');
      expect(result).toEqual(['a', 'b']);
    });

    it('should default to * pattern', async () => {
      mockCacheManager.keys.mockResolvedValue(['defaultKey']);

      const result = await service.keys();

      expect(mockCacheManager.keys).toHaveBeenCalledWith('*');
      expect(result).toEqual(['defaultKey']);
    });
  });
});
