export const TitlePage = ({ title }: { title: string }) => {
    return (
        <div className="title-page w-full flex justify-start px-4 py-3">
            <h1 className="text-2xl">{title}</h1>
        </div>
    );
};
