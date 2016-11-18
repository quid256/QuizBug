build:
	jspm bundle-sfx app/main dist/quizbug.js --minify
	cp css/quizbug.css dist/quizbug.css
