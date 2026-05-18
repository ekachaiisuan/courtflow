import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCardModal } from "@/hooks/use-card-modal";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Header, HeaderSkeleton } from "./header";
import { Description, DescriptionSkeleton } from "./description";
import { Actions, ActionsSkeleton } from "./actions";
import { Activity, ActivitySkeleton } from "./activity";

export const CardModal = () => {
  const { cardData, image, isOpen, logs, name, onClose, onOpen } =
    useCardModal();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <VisuallyHidden>
        <DialogTitle>Card Modal</DialogTitle>
        <DialogDescription>Description</DialogDescription>
      </VisuallyHidden>
      <DialogContent className="bg-white">
        {cardData ? <Header cardWithList={cardData} /> : <HeaderSkeleton />}
        <div className="grid grid-cols-1 md:gap-4 md:grid-cols-4">
          <div className="col-span-3">
            <div className="space-y-6 w-full">
              {cardData ? <Description cardWithList={cardData} /> : <DescriptionSkeleton />}
            </div>
          </div>
          {cardData ? <Actions cardWithList={cardData}/>: <ActionsSkeleton/>}
        </div>
        {logs ? <Activity image={image} name={name} logs={logs}/> : <ActivitySkeleton/>}
      </DialogContent>
    </Dialog>
  );
};
