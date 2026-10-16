export interface Product {
  id: string;
  name: string;
  category: 'pizza' | 'sushi' | 'drinks' | 'desserts';
  price: number;
  oldPrice?: number;
  weight: string;
  description: string;
  image: string;
  isPopular?: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Пепперони Фреш',
    category: 'pizza',
    price: 690,
    oldPrice: 790,
    weight: '450 г',
    description: 'Острая чоризо, моцарелла, фирменный томатный соус и базилик',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 'p2',
    name: 'Четыре Сыра Премиум',
    category: 'pizza',
    price: 790,
    weight: '480 г',
    description: 'Горгонзола, моцарелла, пармезан, чеддер и медовый соус',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p3',
    name: 'Сет Филадельфия Delux',
    category: 'sushi',
    price: 1290,
    oldPrice: 1450,
    weight: '720 г',
    description: 'Классическая Филадельфия, с угрем, с манго и хрустящий ролл',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 'p4',
    name: 'Ролл Дракон с копченым угрём',
    category: 'sushi',
    price: 640,
    weight: '260 г',
    description: 'Угорь, авокадо, сливочный сыр, унаги соус и семена кунжута',
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p5',
    name: 'Матча Латте на кокосовом',
    category: 'drinks',
    price: 320,
    weight: '350 мл',
    description: 'Японская церемониальная матча со взбитым кокосовым молоком',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p6',
    name: 'Цитрусовый Бамбл с карамелью',
    category: 'drinks',
    price: 380,
    weight: '400 мл',
    description: 'Эспрессо со свежевыжатым апельсиновым соком и сиропом соленой карамели',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 'p7',
    name: 'Фисташковый Чизкейк Сан-Себастьян',
    category: 'desserts',
    price: 450,
    weight: '180 г',
    description: 'Обожженный баскский чизкейк с кремовой серединкой и фисташковой пастой',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
    isPopular: true,
  },
];
