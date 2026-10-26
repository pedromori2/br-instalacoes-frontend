import { Orcamento } from "@/lib/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { statusOrcamentoLabel, tipoDescontoLabel } from "@/lib/labels";
import { BRAND_NAME } from "@/lib/brand";

interface PrintableOrcamentoProps {
  orcamento: Orcamento;
}

export function PrintableOrcamento({ orcamento }: PrintableOrcamentoProps) {
  return (
    <div className="print-area px-2 py-4 text-slate-900">
      <div className="flex items-start justify-between border-b border-slate-300 pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Orcamento</p>
          <h1 className="text-2xl font-bold">Nº {orcamento.id}</h1>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{BRAND_NAME}</p>
          <p className="text-slate-500">Status: {statusOrcamentoLabel[orcamento.status]}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Cliente</p>
          <p className="font-medium">{orcamento.clienteNome}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Data do orcamento</p>
          <p className="font-medium">{formatDate(orcamento.dataOrcamento)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Valido ate</p>
          <p className="font-medium">{formatDate(orcamento.dataValidade)}</p>
        </div>
      </div>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-slate-800 text-left">
            <th className="py-2">Item</th>
            <th className="py-2 text-right">Qtd</th>
            <th className="py-2 text-right">Valor unit.</th>
            <th className="py-2 text-right">Desconto</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orcamento.itens.map((item) => (
            <tr key={item.id} className="border-b border-slate-200">
              <td className="py-2">
                {item.itemNome}
                {item.descricaoPersonalizada && (
                  <span className="block text-xs text-slate-500">{item.descricaoPersonalizada}</span>
                )}
              </td>
              <td className="py-2 text-right">{item.quantidade}</td>
              <td className="py-2 text-right">{formatCurrency(item.valorUnitario)}</td>
              <td className="py-2 text-right">
                {item.tipoDesconto === "NENHUM"
                  ? "-"
                  : item.tipoDesconto === "PERCENTUAL"
                  ? `${item.valorDesconto}%`
                  : formatCurrency(item.valorDesconto)}
              </td>
              <td className="py-2 text-right font-medium">{formatCurrency(item.valorTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 flex justify-end border-t-2 border-slate-800 pt-2">
        <div className="w-64 text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Valor total</p>
          <p className="text-xl font-bold">{formatCurrency(orcamento.valorTotal)}</p>
        </div>
      </div>

      {orcamento.observacoes && (
        <div className="mt-6 text-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Observacoes</p>
          <p className="mt-1 whitespace-pre-wrap">{orcamento.observacoes}</p>
        </div>
      )}

      <div className="mt-10 flex items-end justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
        <p>Responsavel: {orcamento.usuarioNome}</p>
        <p>Emitido em {formatDateTime(new Date().toISOString())}</p>
      </div>
    </div>
  );
}
