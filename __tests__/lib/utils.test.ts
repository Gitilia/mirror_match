import { hashPassword, normalizeString } from '@/lib/utils'
import bcrypt from 'bcryptjs'

describe('lib/utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should produce different hashes for the same password', async () => {
      const password = 'testpassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      // Hashes should be different (due to salt)
      expect(hash1).not.toBe(hash2)
      
      // But both should verify correctly
      expect(await bcrypt.compare(password, hash1)).toBe(true)
      expect(await bcrypt.compare(password, hash2)).toBe(true)
    })

    it('should verify passwords correctly', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)
      
      expect(await bcrypt.compare(password, hash)).toBe(true)
      expect(await bcrypt.compare('wrongpassword', hash)).toBe(false)
    })
  })

  describe('normalizeString', () => {
    it('should trim whitespace', () => {
      expect(normalizeString('  test  ')).toBe('test')
      expect(normalizeString('  test')).toBe('test')
      expect(normalizeString('test  ')).toBe('test')
    })

    it('should convert to lowercase', () => {
      expect(normalizeString('TEST')).toBe('test')
      expect(normalizeString('TeSt')).toBe('test')
      expect(normalizeString('Test Name')).toBe('test name')
    })

    it('should handle empty strings', () => {
      expect(normalizeString('')).toBe('')
      expect(normalizeString('   ')).toBe('')
    })

    it('should handle special characters', () => {
      expect(normalizeString('  Test-Name  ')).toBe('test-name')
      expect(normalizeString('John Doe')).toBe('john doe')
    })

    it('should handle mixed case with spaces', () => {
      expect(normalizeString('  JOHN DOE  ')).toBe('john doe')
      expect(normalizeString('jOhN dOe')).toBe('john doe')
    })
  })
})
