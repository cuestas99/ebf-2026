#!/bin/bash
set -e

echo ""
echo " ================================================"
echo "  EBF 2025 - Sistema de Cadastro e Check-in"
echo " ================================================"
echo ""
echo "[1/4] Instalando dependencias..."
npm install

echo "[2/4] Gerando cliente Prisma..."
npx prisma generate

echo "[3/4] Criando banco de dados..."
npx prisma db push

echo "[4/4] Populando dados de exemplo..."
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

echo ""
echo " ================================================"
echo "  Pronto! Rode: npm run dev"
echo "  Acesse: http://localhost:3000"
echo " ================================================"
echo ""
