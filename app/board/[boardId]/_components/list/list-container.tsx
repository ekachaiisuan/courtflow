import { ListForm } from "./list-form"

export const ListContainer = () => {
    return (
        <div className="h-full overflow-x-auto">
            <ol className="flex gap-x-3 h-full pb-2">
                {/*TODO: Add all the lists here*/}
                <ListForm />
                <div className="shrink-0 w-1"></div>
            </ol>
        </div>
    )
}