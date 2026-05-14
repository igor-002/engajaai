export const metadata = { title: "Termos e condições" };

export default function TermsPage() {
  return (
    <section className="container-x max-w-3xl py-12 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight">Termos e condições</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última atualização: {new Date().toLocaleDateString("pt-BR")}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Aceitação</h2>
          <p>
            Ao acessar e utilizar a EngajaAI, você concorda com estes termos. Caso não concorde, não utilize o serviço.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">2. Produtos e entrega</h2>
          <p>
            Os produtos oferecidos têm natureza digital e a entrega ocorre por e-mail e/ou painel da conta após a confirmação do pagamento. O prazo padrão é imediato para itens com entrega automática.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">3. Pagamento</h2>
          <p>
            Aceitamos pagamento via Pix e, em breve, cartão de crédito. Toda transação é processada por gateway homologado e segue as normas do Banco Central do Brasil.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">4. Reembolso</h2>
          <p>
            Itens digitais com entrega automática não admitem reembolso após a entrega, salvo quando comprovada falha técnica imputável à EngajaAI.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">5. Suporte</h2>
          <p>
            Nosso suporte responde via WhatsApp 24/7. Para reclamações formais, contate o e-mail de relacionamento na seção de contato.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">6. Privacidade</h2>
          <p>
            Tratamos dados pessoais conforme a LGPD (Lei 13.709/2018). Coletamos apenas o necessário para entrega do produto e atendimento.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">7. Alterações</h2>
          <p>
            Estes termos podem ser atualizados a qualquer tempo. A versão vigente é sempre a publicada nesta página.
          </p>
        </section>
      </div>
    </section>
  );
}
