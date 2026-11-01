import { RecomendacaoStrategy } from './RecomendacaoStrategy';
import { Projeto } from '../../models/Projeto';
import { Profissional } from '../../models/Profissional';
import { Papel } from '../../models/Papel';
import { ServicoAtomico } from '../composite/ServicoAtomico';
import { PacoteServico } from '../composite/PacoteServico';

export class RecomendadorBase implements RecomendacaoStrategy {
  public recomendar(projeto: Projeto, profissionais: Profissional[]): Map<Papel, Profissional[]> {
    const mapa = new Map<Papel, Profissional[]>();
    const papeisNecessarios = this.extrairPapeisNecessarios(projeto);

    const papeisAlvo = papeisNecessarios.size > 0
      ? Array.from(papeisNecessarios)
      : Array.from(new Set(profissionais.map((p) => p.papel)));

    for (const papel of papeisAlvo) {
      const candidatos = profissionais
        .filter((p) => p.papel === papel && p.disponivel)
        .sort((a, b) => {
          const mediaA = a.calcularMediaAvaliacoes();
          const mediaB = b.calcularMediaAvaliacoes();
          if (mediaB !== mediaA) {
            return mediaB - mediaA;
          }
          return b.competencias.length - a.competencias.length;
        });

      mapa.set(papel, candidatos);
    }

    return mapa;
  }

  private extrairPapeisNecessarios(projeto: Projeto): Set<Papel> {
    const papeis = new Set<Papel>();
    const servico = projeto.servicoPrincipal;

    if (!servico) {
      return papeis;
    }

    if (servico instanceof ServicoAtomico) {
      papeis.add(servico.papel);
    } else if (servico instanceof PacoteServico) {
      for (const atomico of servico.obterServicosAtomicos()) {
        papeis.add(atomico.papel);
      }
    } else {
      const subservicos = servico.listarSubservicos();
      for (const sub of subservicos) {
        if ('papel' in (sub as any)) {
          papeis.add((sub as any).papel);
        }
      }
    }

    return papeis;
  }
}
