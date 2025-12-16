import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '1.5rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			brand: {
  				DEFAULT: 'hsl(var(--brand))',
  				foreground: 'hsl(var(--brand-foreground))',
  				muted: 'hsl(var(--brand-muted))'
  			},
  			belt: {
  				white: '#FFFFFF',
  				grey: '#808080',
  				yellow: '#FFD700',
  				orange: '#FF8C00',
  				green: '#228B22'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'var(--font-space-grotesk)',
  				'system-ui',
  				'sans-serif'
  			],
  			serif: [
  				'var(--font-playfair)',
  				'Georgia',
  				'serif'
  			]
  		},
  		fontSize: {
  			'display-xl': [
  				'clamp(3rem, 5vw + 1rem, 5rem)',
  				{
  					lineHeight: '1.1',
  					letterSpacing: '-0.02em'
  				}
  			],
  			'display-lg': [
  				'clamp(2.25rem, 4vw + 0.5rem, 3.75rem)',
  				{
  					lineHeight: '1.1',
  					letterSpacing: '-0.02em'
  				}
  			],
  			'display-md': [
  				'clamp(1.875rem, 3vw + 0.5rem, 2.5rem)',
  				{
  					lineHeight: '1.2',
  					letterSpacing: '-0.01em'
  				}
  			],
  			'display-sm': [
  				'clamp(1.5rem, 2vw + 0.5rem, 2rem)',
  				{
  					lineHeight: '1.3',
  					letterSpacing: '-0.01em'
  				}
  			]
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'fade-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-right': {
  				from: {
  					transform: 'translateX(100%)'
  				},
  				to: {
  					transform: 'translateX(0)'
  				}
  			},
  			'slide-out-right': {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(100%)'
  				}
  			},
  			'gradient-x': {
  				'0%, 100%': {
  					'background-position': '0% 50%'
  				},
  				'50%': {
  					'background-position': '100% 50%'
  				}
  			},
  			'float': {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
  			'shimmer': {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			},
  			'glow-pulse': {
  				'0%, 100%': {
  					opacity: '0.4',
  					transform: 'scale(1)'
  				},
  				'50%': {
  					opacity: '0.8',
  					transform: 'scale(1.05)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.3s ease-out',
  			'fade-up': 'fade-up 0.4s ease-out',
  			'slide-in-right': 'slide-in-right 0.3s ease-out',
  			'slide-out-right': 'slide-out-right 0.3s ease-out',
  			'gradient-x': 'gradient-x 3s ease infinite',
  			'float': 'float 6s ease-in-out infinite',
  			'shimmer': 'shimmer 2s linear infinite',
  			'glow-pulse': 'glow-pulse 3s ease-in-out infinite'
  		},
  		spacing: {
  			touch: '44px',
  			'touch-lg': '56px'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
