"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function MesaItens({ mesa }) {
  const getBalanceColor = (saldo) => saldo > 0 ? 'text-green-600 dark:text-green-400' : saldo < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600'
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
          <ShoppingCart className="w-3 h-3 mr-2" />
          Ver Produtos da Mesa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Produtos - {mesa.nome_mesa}</DialogTitle>
        </DialogHeader>
        {mesa.itens.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded gap-2 sm:gap-0"
          >
            <div className="flex-1">
              <p
                className={`font-medium ${item.ehAbatimento ? "text-red-500 dark:text-red-400" : ""}`}
              >
                {item.nome}
              </p>
              {!item.ehAbatimento ? (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.preco)} cada
                </p>
              ) : (
                <p className="text-sm text-red-500 dark:text-red-400 italic">
                  Pagamento parcial
                </p>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {!item.ehAbatimento && (
                <div className="flex items-center border rounded-md bg-white dark:bg-gray-900">
                  <span className="w-9 p-2 text-center text-sm font-medium">
                    {item.quantidade}
                  </span>
                </div>
              )}

              <span
                className={`font-bold min-w-[4rem] text-right ${item.ehAbatimento ? "text-red-500 dark:text-red-400" : ""}`}
              >
                {formatCurrency(item.preco * item.quantidade)}
              </span>
            </div>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}