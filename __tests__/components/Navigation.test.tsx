import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import Navigation from '@/components/Navigation'

jest.mock('next-auth/react')

describe('Navigation', () => {
  it('should not render when user is not logged in', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    const { container } = render(<Navigation />)
    expect(container.firstChild).toBeNull()
  })

  it('should render navigation when user is logged in', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
        },
      },
      status: 'authenticated',
    })

    render(<Navigation />)
    
    expect(screen.getByText('MirrorMatch')).toBeInTheDocument()
    expect(screen.getByText('Photos')).toBeInTheDocument()
    expect(screen.getByText('Upload')).toBeInTheDocument()
    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Hello, Test User')).toBeInTheDocument()
  })

  it('should show admin link for ADMIN users', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
      },
      status: 'authenticated',
    })

    render(<Navigation />)
    
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('should not show admin link for regular users', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
        },
      },
      status: 'authenticated',
    })

    render(<Navigation />)
    
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })
})
