import type { PastaItem } from "@/types/pasta";

// Sample photos from Unsplash (free to use under the Unsplash License), cropped square.
// Replace any of them from the dashboard with your own product photos.
const unsplash = (photo: string) =>
  `https://images.unsplash.com/${photo}?w=720&h=720&fit=crop&q=75&auto=format`;

// Starter inventory.
export const SEED_ITEMS: PastaItem[] = [
  {
    id: "seed-sorrentinos",
    title: "Sorrentinos de Jamón y Queso",
    category: "pasta",
    description:
      "Redondos y generosos, rellenos de jamón cocido, mozzarella y un toque de nuez moscada. La masa es fina, hecha con huevo, y se cocina en cuatro minutos. Quedan muy bien con salsa fileto, crema o simplemente manteca y salvia. Se entregan frescos, listos para hervir o para congelar.",
    price: 4200,
    unit: "12 unidades",
    imageUrl: unsplash("photo-1587740908075-9e245070dfaa"),
    available: true,
  },
  {
    id: "seed-tallarines",
    title: "Tallarines al Huevo",
    category: "pasta",
    description:
      "Cortados a cuchillo y hechos con huevo de campo, tienen una textura firme y un sabor profundo. Se cocinan en tres minutos y sostienen bien tanto una salsa liviana de tomate como un estofado de carne. Se venden por porción de 500 gramos, enrollados en nidos para que lleguen enteros.",
    price: 850,
    unit: "500g",
    imageUrl: unsplash("photo-1633352615955-f0c99e8b7e5a"),
    available: true,
  },
  {
    id: "seed-ravioles",
    title: "Ravioles de Verdura y Ricota",
    category: "pasta",
    description:
      "Rellenos de acelga, espinaca y ricota fresca, con un punto de queso rallado y pimienta. La pasta es casera y no lleva conservantes, por eso conviene cocinarla en el día o congelarla. Combinan con salsa de tomate, crema de puerro o un simple hilo de aceite de oliva.",
    price: 3900,
    unit: "12 unidades",
    imageUrl: unsplash("photo-1676832661871-994153cf2d93"),
    available: true,
  },
  {
    id: "seed-noquis",
    title: "Ñoquis de Papa",
    category: "pasta",
    description:
      "Hechos con papa cocida al horno, harina y huevo, amasados con poca fuerza para que salgan livianos. Están listos cuando suben a la superficie del agua, en dos o tres minutos. Van bien con bolognesa, pesto o salsa de cuatro quesos. Tradicionalmente se comen el 29 de cada mes.",
    price: 1100,
    unit: "kg",
    imageUrl: unsplash("photo-1630444098747-2afd213cb945"),
    available: true,
  },
  {
    id: "seed-fusilli",
    title: "Fusilli Largos",
    category: "pasta",
    description:
      "Enrollados a mano en espiral alrededor de una varilla, uno por uno. La forma retiene las salsas espesas entre las vueltas, así que van muy bien con ragú, pesto de albahaca o verduras salteadas. Se cocinan en cinco minutos y mantienen el punto firme sin pasarse.",
    price: 1250,
    unit: "500g",
    imageUrl: unsplash("photo-1607191717990-fa32f77b4aeb"),
    available: false,
  },
  {
    id: "seed-bolognesa",
    title: "Salsa Bolognesa",
    category: "sauces",
    description:
      "Carne picada, tomate triturado, zanahoria, apio y cebolla, cocinados a fuego lento durante cuatro horas con un chorro de vino tinto. Queda espesa y bien sabrosa, ideal sobre tallarines, ñoquis o capas de lasaña. Alcanza para dos porciones abundantes y se conserva cinco días en heladera.",
    price: 2800,
    unit: "500g",
    imageUrl: unsplash("photo-1622973536968-3ead9e780960"),
    available: true,
  },
  {
    id: "seed-cremoso",
    title: "Queso Cremoso Casero",
    category: "cheese",
    description:
      "Elaborado con leche entera, cuajo natural y sal marina, de pasta blanda y sabor suave y lácteo. Se funde muy bien, por eso es ideal para rellenar sorrentinos, gratinar pastas al horno o servir en tabla con un poco de miel. Se vende en pieza de medio kilo, envasada al vacío.",
    price: 3400,
    unit: "500g",
    imageUrl: unsplash("photo-1605466237780-80b87584957b"),
    available: true,
  },
  {
    id: "seed-parmesano",
    title: "Parmesano Rallado",
    category: "cheese",
    description:
      "Curado durante doce meses y rallado en el día, con ese sabor intenso y un poco salado que lo hace inconfundible. Se agrega al final sobre pastas calientes, risottos o sopas, y también rinde en rellenos. Viene en frasco de vidrio con tapa, para que mantenga el aroma.",
    price: 2100,
    unit: "200g",
    imageUrl: unsplash("photo-1752253509987-f92fd1cf4a78"),
    available: true,
  },
];
