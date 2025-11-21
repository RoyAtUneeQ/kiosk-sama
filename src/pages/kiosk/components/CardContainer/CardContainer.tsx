import './CardContainer.scss';

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="card-container">
            {children}
        </div>
    );
};