import { type ErrorRouteComponent } from '@tanstack/react-router';

const ErrorComponent: ErrorRouteComponent = ({ error }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f7fafc', // Similar to bg-gray-100
      padding: '1rem'
    }}
  >
    <h1
      style={{
        fontSize: '3.75rem', // roughly text-6xl
        fontWeight: 'bold',
        color: '#ef4444', // text-red-500
        marginBottom: '1rem'
      }}
    >
      Something Went Wrong
    </h1>
    <p
      style={{
        fontSize: '1.125rem', // text-lg
        color: '#374151', // text-gray-700
        marginBottom: '1.5rem'
      }}
    >
      We encountered an unexpected error. Please try again later.
    </p>
    {error && (
      <pre
        style={{
          backgroundColor: '#ffffff', // bg-white
          padding: '1rem', // p-4
          borderRadius: '0.25rem', // rounded
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)', // shadow-md
          textAlign: 'left',
          width: '100%',
          maxWidth: '32rem', // max-w-lg
          overflow: 'auto'
        }}
      >
        <code
          style={{
            fontSize: '0.875rem', // text-sm
            color: '#dc2626' // text-red-600
          }}
        >
          {error.message}
        </code>
      </pre>
    )}
    <button
      onClick={() => window.location.reload()}
      style={{
        marginTop: '1.5rem', // mt-6
        padding: '0.5rem 1.25rem', // px-5 py-2
        backgroundColor: '#2563eb', // bg-blue-600
        color: '#ffffff', // text-white
        borderRadius: '0.25rem', // rounded
        cursor: 'pointer',
        transition: 'background-color 0.2s ease-in-out'
      }}
    >
      Reload Page
    </button>
  </div>
);

export default ErrorComponent;
