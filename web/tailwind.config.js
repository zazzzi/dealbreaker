/** @type {import('tailwindcss').Config} */
export default {

	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}" // Ensure you target all relevant files in the src directory
	],
	theme: {
		extend: {
			// You can add custom themes here later, e.g. colors, fonts
			colors: {
				debugblue: '#00f',
			},
			spacing: {
				'1': '8px',
				'2': '12px',
				'3': '16px',
				'4': '24px',
				'5': '32px',
				'6': '48px',
				'7': '64px',
				'8': '128px',
			},
		},
	},
	plugins: [],

};
