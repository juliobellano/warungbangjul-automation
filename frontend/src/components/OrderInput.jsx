import React, { useState } from 'react';
import { submitOrder } from '../services/api';

// Note: In a real implementation, you would import these UI components from ShadCN
// For brevity, we'll define simple placeholders here
const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="p-4 border-b">{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-xl font-bold">{children}</h3>
);

const CardDescription = ({ children }) => (
  <p className="text-gray-500 mt-1">{children}</p>
);

const CardContent = ({ children }) => (
  <div className="p-4">{children}</div>
);

const CardFooter = ({ children }) => (
  <div className="p-4 border-t">{children}</div>
);

const Textarea = ({ value, onChange, placeholder, className, required }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full border rounded-md p-2 ${className}`}
    required={required}
  />
);

const Button = ({ onClick, disabled, className, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 ${className}`}
  >
    {children}
  </button>
);

const Alert = ({ variant, className, children }) => (
  <div className={`p-4 rounded-md mt-4 ${variant === 'destructive' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'} ${className}`}>
    {children}
  </div>
);

const OrderInput = () => {
  const [orderText, setOrderText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setResult(null);

    try {
      const response = await submitOrder(orderText);
      setResult(response);
      // Clear the form after successful submission
      setOrderText('');
    } catch (err) {
      setError(err.detail || 'An error occurred while processing the order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>New Order</CardTitle>
        <CardDescription>
          Enter order in format: "Name Quantity+Code" (e.g., "John 2SE + 1T")
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Textarea
            value={orderText}
            onChange={(e) => setOrderText(e.target.value)}
            placeholder="Enter order text here..."
            className="min-h-32"
            required
          />
          
          {error && (
            <Alert variant="destructive">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-bold">Error</div>
                  <div>{error}</div>
                </div>
              </div>
            </Alert>
          )}
          
          {result && (
            <Alert>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-bold">Order Processed Successfully</div>
                  <div className="mt-2">
                    <div><strong>Customer:</strong> {result.order.customer_name}</div>
                    <div><strong>Total:</strong> {result.order.total_amount} NTD</div>
                    <div><strong>Items:</strong></div>
                    <ul className="list-disc pl-5">
                      {result.order.items.map((item, index) => (
                        <li key={index}>
                          {item.quantity} x {item.name} ({item.code}) - {item.item_total} NTD
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !orderText.trim()}
          className="w-full"
        >
          {isSubmitting ? 'Processing...' : 'Process Order'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderInput;