import type { PresetInput } from '@/core/presets/schemas'

export const smilesPresets: PresetInput[] = [
  {
    id: 'clube-smiles',
    label: 'Clube Smiles',
    type: 'formatting',
    template: '<strong style="color: #663399; display: inline-block">{{selection}}</strong>',
  },
  {
    id: 'cliente-smiles',
    label: 'Cliente Smiles',
    type: 'formatting',
    template: '<strong style="color: #ff7020; display: inline-block">{{selection}}</strong>',
  },
  {
    id: 'diamante',
    label: 'Diamante',
    type: 'formatting',
    template: '<strong style="color: #231f20">{{selection}}</strong>',
  },
  {
    id: 'clientes-ouro',
    label: 'Clientes Ouro',
    type: 'formatting',
    template: '<strong style="color: #C6A76E !important; display: inline-block">{{selection}}</strong>',
  },
  {
    id: 'cliente-prata',
    label: 'Cliente Prata',
    type: 'formatting',
    template: '<strong style="color: #737373 !important; display: inline-block">{{selection}}</strong>',
  },
  {
    id: 'macro-clube-smiles',
    label: 'Macro Clube Smiles',
    description: 'Link interno para abertura da macro de adesão ao Clube Smiles.',
    type: 'link',
    href: '#p_p_id_smilesmembershipclubjoinmacro_WAR_smilesmembershipsportlet_',
    template:
      '<a href="{{href}}" style="color: #663399; text-decoration: underline; font-weight: bold;">{{selection}}</a>',
  },
  {
    id: 'macro-optin',
    label: 'Macro Opt-in',
    type: 'link',
    href: '#p_p_id_promotionoptinportlet_WAR_smilesaccountportlet_INSTANCE_wDrtOrYBnN4Z_',
    template: '<a href="{{href}}">{{selection}}</a>',
  },
  {
    id: 'pagina-clube-smiles',
    label: 'Página Clube Smiles',
    type: 'link',
    href: 'https://www.smiles.com.br/clube-smiles',
    template: '<a href="{{href}}" style="color: #663399; text-decoration: underline">{{selection}}</a>',
  },
  {
    id: 'tarja-vigencia',
    label: 'Tarja de vigência',
    description: 'Snippet histórico; revisar estrutura e classes antes de publicar.',
    type: 'snippet',
    reviewBeforeUse: true,
    template:
      '<div class="atomoPeriodoLP atomo-btn-laranja-smiles" style="margin-top: 9px!important;"><p>{{text}}</p></div>',
  },
  {
    id: 'texto-apoio-clube-cta',
    label: 'Texto apoio Clube + CTA',
    description: 'Snippet histórico; revisar copy e destino antes de publicar.',
    type: 'snippet',
    reviewBeforeUse: true,
    template:
      '<div class="txt__bfr-pas_w_cta"><p>Ainda não faz parte do <strong style="color: #663399; display: inline-block">Clube Smiles</strong>? <a href="#p_p_id_smilesmembershipclubjoinmacro_WAR_smilesmembershipsportlet_" style="color: #663399; text-decoration: underline">Entre já</a> e aproveite muitos benefícios!</p></div>',
  },
]
