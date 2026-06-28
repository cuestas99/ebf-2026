@echo off
echo.
echo  ================================================
echo   EBF 2025 - Sistema de Cadastro e Check-in
echo  ================================================
echo.
echo [1/4] Instalando dependencias...
call npm install
echo.
echo [2/4] Gerando cliente Prisma...
call npx prisma generate
echo.
echo [3/4] Criando banco de dados...
call npx prisma db push
echo.
echo [4/4] Populando dados de exemplo...
call npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts
echo.
echo  ================================================
echo   Pronto! Rode: npm run dev
echo   Acesse: http://localhost:3000
echo  ================================================
echo.
pause
