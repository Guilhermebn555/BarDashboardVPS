'use client'

import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SearchAndFilters({
  searchQuery, setSearchQuery,
  showFilters, setShowFilters,
  activeFilters,
  filtroDiaPagamento, setFiltroDiaPagamento,
  filtroLimiteMin, setFiltroLimiteMin,
  filtroLimiteMax, setFiltroLimiteMax,
  filtroStatus, setFiltroStatus,
  filtroFinanceiro, setFiltroFinanceiro,
  filtroTag, setFiltroTag,
  filtroDados, setFiltroDados,
  ordenacao, setOrdenacao,
  resetFilters
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <Input
            type="text"
            placeholder="Buscar cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 sm:h-12 text-base sm:text-lg"
          />
        </div>
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 sm:h-12 w-full sm:w-auto">
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">{activeFilters.length}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-[80vh] overflow-y-auto" align="end">
            <div className="space-y-4">
              <div><h4 className="font-semibold mb-3">Filtros Avançados</h4></div>
              
              <div>
                <Label>Ordenar Por</Label>
                <Select value={ordenacao} onValueChange={setOrdenacao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nome_asc">Nome (A-Z)</SelectItem>
                    <SelectItem value="nome_desc">Nome (Z-A)</SelectItem>
                    <SelectItem value="saldo_menor">Maior Dívida (Saldo Negativo)</SelectItem>
                    <SelectItem value="saldo_maior">Maior Crédito (Saldo Positivo)</SelectItem>
                    <SelectItem value="limite_maior">Maior Limite de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status da Conta</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="suspenso">Suspensos</SelectItem>
                    <SelectItem value="cancelado">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Situação Financeira</Label>
                <Select value={filtroFinanceiro} onValueChange={setFiltroFinanceiro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="devedores">Apenas Devedores</SelectItem>
                    <SelectItem value="credores">Apenas Credores (Saldo positivo)</SelectItem>
                    <SelectItem value="zerados">Saldo Zerado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filtroTag">Filtrar por Tag</Label>
                <Input
                  id="filtroTag"
                  type="text"
                  value={filtroTag}
                  onChange={(e) => setFiltroTag(e.target.value)}
                  placeholder="Ex: VIP, Atrasado..."
                />
              </div>

              <div>
                <Label>Dados Cadastrais</Label>
                <Select value={filtroDados} onValueChange={setFiltroDados}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="sem_telefone">Sem Telefone</SelectItem>
                    <SelectItem value="sem_email">Sem E-mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filtroDia">Dia de Pagamento</Label>
                <Input
                  id="filtroDia"
                  type="number"
                  min="1"
                  max="31"
                  value={filtroDiaPagamento}
                  onChange={(e) => setFiltroDiaPagamento(e.target.value)}
                  placeholder="Ex: 10"
                />
              </div>

              <div>
                <Label>Limite de Crédito</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" step="0.1" value={filtroLimiteMin} onChange={(e) => setFiltroLimiteMin(e.target.value)} placeholder="Mínimo" />
                  <Input type="number" step="0.1" value={filtroLimiteMax} onChange={(e) => setFiltroLimiteMax(e.target.value)} placeholder="Máximo" />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t mt-2">
                <Button variant="outline" size="sm" onClick={resetFilters} className="flex-1">Limpar</Button>
                <Button size="sm" onClick={() => setShowFilters(false)} className="flex-1">Aplicar</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {(activeFilters.length > 0 || searchQuery) && (
        <div className="flex flex-wrap gap-2 max-w-2xl mx-auto">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Busca: "{searchQuery}"
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
            </Badge>
          )}
          {activeFilters.map((filter, idx) => (
            <Badge key={idx} variant="secondary" className="flex items-center gap-1">
              {filter}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => {
                  if (filter.includes('Status')) setFiltroStatus('todos')
                  if (filter.includes('Apenas') || filter.includes('Saldo')) setFiltroFinanceiro('todos')
                  if (filter.includes('Tag')) setFiltroTag('')
                  if (filter.includes('Sem')) setFiltroDados('todos')
                  if (filter.includes('Dia')) setFiltroDiaPagamento('')
                  if (filter.includes('Limite')) { setFiltroLimiteMin(''); setFiltroLimiteMax(''); }
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}