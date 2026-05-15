import { BoardActionLog, CardWithList } from "@/db/schema";
import { create } from "zustand";

type CardModalStore = {
  cardData: CardWithList | null;
  image: string | null;
  isOpen: boolean;
  logs: BoardActionLog[] | null;
  name: string | null;
  onClose: () => void;
  onOpen: (
    cardData: CardWithList | null,
    image: string | null,
    logs: BoardActionLog[] | null,
    name: string,
  ) => void;
};

export const useCardModal = create<CardModalStore>((set) => ({
  cardData: null,
  image: null,
  isOpen: false,
  logs: null,
  name: null,
  onClose: () =>
    set({ cardData: null, image: null, isOpen: false, logs: null, name: null }),
  onOpen: (
    cardData: CardWithList | null,
    image: string | null,
    logs: BoardActionLog[] | null,
    name: string,
  ) => set({ cardData, image, isOpen: true, logs, name }),
}));
